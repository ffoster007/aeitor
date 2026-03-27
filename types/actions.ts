// types/actions.ts

export type ActionResult =
  | { success: true }
  | {
      success: false;
      errors: Partial<Record<string, string[]>> & {
        _form?: string[];
      };
    };