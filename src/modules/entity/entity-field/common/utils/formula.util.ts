import { isSymbolNode, parse, SymbolNode } from 'mathjs';

export class FormulaUtil {
  public static extractVariables(formula: string): string[] {
    return formula
      ? parse(formula)
          .filter((n) => isSymbolNode(n))
          .map((n) => (n as SymbolNode)?.name)
      : [];
  }

  public static createFieldKey({ entityTypeId, fieldId }: { entityTypeId: number; fieldId: number }): string {
    return `et${entityTypeId}_f${fieldId}`;
  }

  public static parseFieldKey(fieldKey: string): { entityTypeId: number; fieldId: number } {
    const [entityTypeId, fieldId] = fieldKey.split('_');
    return { entityTypeId: Number(entityTypeId.substring(2)), fieldId: Number(fieldId.substring(1)) };
  }
}
