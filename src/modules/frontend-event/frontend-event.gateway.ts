import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { TokenService } from '@/common';
import { TokenPayload } from '@/modules/iam/common';

@WebSocketGateway({ path: '/api/socket.io', cors: { origin: '*' } })
export class FrontendEventGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  private readonly logger = new Logger(FrontendEventGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly tokenService: TokenService) {}

  handleConnection(client: Socket) {
    try {
      const payload = this.tokenService.verify<TokenPayload>(client.handshake.auth['token']);
      client.join([this.getUserRoomName(payload.userId), this.getAccountRoomName(payload.accountId)]);
    } catch (e) {
      this.logger.warn(`NotificationGateway.handleConnection error: ${e.toString()}`);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const payload = this.tokenService.verify<TokenPayload>(client.handshake.auth['token']);
      client.leave(this.getUserRoomName(payload.userId));
      client.leave(this.getAccountRoomName(payload.accountId));
    } catch (e) {
      this.logger.warn(`NotificationGateway.handleDisconnect error: ${e.toString()}`);
    }
  }

  notifyUser(userId: number, type: string, notification: unknown) {
    this.server.to(this.getUserRoomName(userId)).emit(type, notification);
  }

  notifyAccount(accountId: number, type: string, notification: unknown) {
    this.server.to(this.getAccountRoomName(accountId)).emit(type, notification);
  }

  private getUserRoomName(userId: number): string {
    return userId.toString();
  }
  private getAccountRoomName(accountId: number): string {
    return accountId.toString();
  }
}
