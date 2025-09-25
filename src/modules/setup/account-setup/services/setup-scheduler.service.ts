import { Injectable, Logger } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { ScheduleService } from '@/modules/scheduler/schedule/services/schedule.service';
import { ScheduleAppointmentService } from '@/modules/scheduler/schedule-appointment/schedule-appointment.service';

interface SchedulerMaps {
  schedulesMap: Map<number, number>;
  appointmentsMap: Map<number, number>;
}

@Injectable()
export class SetupSchedulerService {
  private readonly logger = new Logger(SetupSchedulerService.name);

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly appointmentService: ScheduleAppointmentService,
  ) {}

  public async copyAll(
    rmsAccountId: number,
    accountId: number,
    owner: User,
    usersMap: Map<number, User>,
    departmentsMap: Map<number, number>,
    entityTypesMap: Map<number, number>,
    entitiesMap: Map<number, number>,
    sectionsMap: Map<number, number>,
    ordersMap: Map<number, number>,
    schedulerIds?: number[],
  ): Promise<SchedulerMaps> {
    const { schedulesMap, performersMap } = await this.copySchedules(
      rmsAccountId,
      accountId,
      owner,
      usersMap,
      departmentsMap,
      entityTypesMap,
      sectionsMap,
      schedulerIds,
    );

    const appointmentsMap = await this.copyAppointments(
      rmsAccountId,
      accountId,
      usersMap,
      entitiesMap,
      ordersMap,
      schedulesMap,
      performersMap,
    );

    return { schedulesMap, appointmentsMap };
  }

  private async copySchedules(
    rmsAccountId: number,
    accountId: number,
    owner: User,
    usersMap: Map<number, User>,
    departmentsMap: Map<number, number>,
    entityTypesMap: Map<number, number>,
    sectionsMap: Map<number, number>,
    schedulerIds?: number[],
  ): Promise<{ schedulesMap: Map<number, number>; performersMap: Map<number, number> }> {
    const allSchedules = await this.scheduleService.findMany({ filter: { accountId: rmsAccountId } });
    const rmsSchedules = schedulerIds ? allSchedules.filter((s) => schedulerIds.includes(s.id)) : allSchedules;

    const schedulesMap = new Map<number, number>();
    const performersMap = new Map<number, number>();
    for (const rmsSchedule of rmsSchedules) {
      try {
        const schedule = await this.scheduleService.create({
          accountId,
          userId: owner.id,
          dto: {
            name: rmsSchedule.name,
            icon: rmsSchedule.icon,
            type: rmsSchedule.type,
            timePeriod: rmsSchedule.timePeriod,
            appointmentLimit: rmsSchedule.appointmentLimit,
            entityTypeId: rmsSchedule.entityTypeId ? entityTypesMap.get(rmsSchedule.entityTypeId) : null,
            productsSectionId: rmsSchedule.productsSectionId ? sectionsMap.get(rmsSchedule.productsSectionId) : null,
            performers: rmsSchedule.performers.map((p) => ({
              type: p.type,
              userId: p.userId ? usersMap.get(p.userId).id : null,
              departmentId: p.departmentId ? departmentsMap.get(p.departmentId) : null,
            })),
          },
        });
        schedulesMap.set(rmsSchedule.id, schedule.id);
        rmsSchedule.performers.forEach((rmsPerformer, idx) =>
          performersMap.set(rmsPerformer.id, schedule.performers[idx].id),
        );
      } catch (e) {
        this.logger.error(`Error during schedule creation for account ${accountId}`, (e as Error)?.stack);
        continue;
      }
    }

    return { schedulesMap, performersMap };
  }

  private async copyAppointments(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entitiesMap: Map<number, number>,
    ordersMap: Map<number, number>,
    schedulesMap: Map<number, number>,
    performersMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const appointmentsMap = new Map<number, number>();

    for (const [rmsScheduleId, scheduleId] of schedulesMap) {
      const rmsAppointments = await this.appointmentService.findMany({
        filter: { accountId: rmsAccountId, scheduleId: rmsScheduleId },
        joinPerformer: true,
      });
      for (const rmsAppointment of rmsAppointments) {
        try {
          const appointment = await this.appointmentService.create({
            accountId,
            user: usersMap.get(rmsAppointment.ownerId),
            dto: {
              scheduleId,
              startDate: rmsAppointment.startDate.toISOString(),
              endDate: rmsAppointment.endDate.toISOString(),
              status: rmsAppointment.status,
              title: rmsAppointment.title,
              comment: rmsAppointment.comment,
              entityId: rmsAppointment.entityId ? entitiesMap.get(rmsAppointment.entityId) : null,
              performerId: performersMap.get(rmsAppointment.performerId),
              orderId: rmsAppointment.orderId ? ordersMap.get(rmsAppointment.orderId) : null,
            },
          });
          appointmentsMap.set(rmsAppointment.id, appointment.id);
        } catch (e) {
          this.logger.error(`Error during appointment creation for schedule ${scheduleId}`, (e as Error)?.stack);
          continue;
        }
      }
    }

    return appointmentsMap;
  }
}
