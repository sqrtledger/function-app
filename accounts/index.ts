import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const container = await Container.get();

  try {
    const result = await container.accountRepository.create({
      availableBalance: 0,
      balance: 0,
      label: req.body.label,
      metadata: req.body.metadata,
      name: req.body.name,
      reference: req.body.reference,
      settings: {
        allowCreditTransactions: true,
        allowDebitTransactions: true,
        allowTransactions: true,
      },
      status: req.body.active ? 'active' : 'inactive',
    });

    context.res = {
      body: result,
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: {
        message: error.message,
      },
    };
  }
};

export default httpTrigger;
