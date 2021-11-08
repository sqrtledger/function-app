import * as Joi from 'joi';

export class AccountPostValidator {
  protected static joiObjectSchemaBody = Joi.object({
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

  protected static joiObjectSchemaParams = Joi.object({
    reference: Joi.string().min(5).max(32).required(),
  });

  public static validate(body: any, params: any): void {
    const joiValidationResultBody =
      AccountPostValidator.joiObjectSchemaBody.validate(body);

    if (joiValidationResultBody.error) {
      throw new Error(joiValidationResultBody.error.message);
    }

    const joiValidationResultParams =
      AccountPostValidator.joiObjectSchemaParams.validate(body);

    if (joiValidationResultParams.error) {
      throw new Error(joiValidationResultParams.error.message);
    }
  }
}
