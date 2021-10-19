import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    if (req.body instanceof Array) {
      const result =
        await container.transactionService.createProcessCompleteMultiple(
          req.body
        );

      context.res = {
        body: result,
      };

      return;
    }

    if (req.body instanceof Object) {
      const result = await container.transactionService.createProcessComplete(
        req.params.reference,
        req.body.amount,
        req.body.collectionReference,
        req.body.metadata,
        req.body.reference,
        req.body.type
      );

      context.res = {
        body: result.transaction,
      };

      return;
    }
  } catch (error) {
    context.log(error.message);

    context.res = {
      status: 400,
      body: {
        message: error.message,
      },
    };
  }
};

export default httpTrigger;
