import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ITransaction } from 'sqrtledger-core';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    const credentials =
      await container.credentialsService.authorizationHeaderToCredentials(
        req.headers['authorization']
      );

    if (!credentials) {
      context.res = {
        body: {
          message: 'Unauthorized',
        },
        status: 401,
      };

      return;
    }

    const transaction: ITransaction | null =
      await container.transactionService.find(
        req.params.reference,
        credentials.clientId
      );

    context.res = {
      body: transaction,
    };
  } catch (error) {
    context.log(`[ERROR]: ${error.message}`);

    context.res = {
      body: {
        message: error.message,
      },
      status: 500,
    };
  }
};

export default httpTrigger;
