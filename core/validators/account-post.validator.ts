import * as Joi from 'joi';

export class AccountPostValidator {
  protected static joiObjectSchema = Joi.object({
    active: Joi.boolean().required(),
    label: Joi.string().min(5).max(32).required(),
    metadata: Joi.object().unknown().required(),
    name: Joi.string().min(5).max(32).required(),
    reference: Joi.string().min(5).max(32).required(),
    settings: Joi.object({
      allowTransactions: Joi.boolean().required(),
      allowCreditTransactions: Joi.boolean().required(),
      allowDebitTransactions: Joi.boolean().required(),
    }).required(),
  });

  public static validate(obj: any): void {
    const joiValidationResult =
      AccountPostValidator.joiObjectSchema.validate(obj);

    if (joiValidationResult.error) {
      throw new Error(joiValidationResult.error.message);
    }
  }
}
