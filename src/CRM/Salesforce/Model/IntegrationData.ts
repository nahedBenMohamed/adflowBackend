import { UIDataRecord } from '../../Model/ExternalEntity/UIDataRecord';

export class IntegrationData {
  rawData: object;
  uiData: UIDataRecord[];

  constructor(rawData: object, uiData: UIDataRecord[]) {
    this.rawData = rawData;
    this.uiData = uiData;
  }
}
