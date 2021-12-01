import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ICustomer } from 'sqrtledger-core';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    const customer: ICustomer | null = await container.customerService.find(
      req.params.emailAddress
    );

    context.res = {
      body: customer,
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
