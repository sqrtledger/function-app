import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ICustomerView } from 'sqrtledger-core';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    const customers: Array<ICustomerView> =
      await container.customerService.findAll(req.params.reference);

    context.res = {
      body: customers,
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
