export enum SalesPipelineType {
  All = 'all',
  AllActive = 'all_active',
  Open = 'open',
  OpenActive = 'open_active',
  Closed = 'closed',
  Created = 'created',
}

export const SalesPipelineTypes = {
  All: [SalesPipelineType.All, SalesPipelineType.AllActive],
  Open: [SalesPipelineType.Open, SalesPipelineType.OpenActive],
  Closed: [SalesPipelineType.Closed],
  Created: [SalesPipelineType.Created],
  Active: [SalesPipelineType.AllActive, SalesPipelineType.OpenActive],
};
