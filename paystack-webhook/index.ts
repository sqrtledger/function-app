import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ICard, ICustomer } from 'sqrtledger-core';
import { AuthorizationHelper, Container } from '../core';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const container = await Container.get();

    if (!container) {
      context.res = {
        status: 400,
      };

      return;
    }

    const body: {
      data: {
        amount: number;
        authorization: {
          authorization_code: string;
          bin: string;
          exp_month: string;
          exp_year: string;
          last4: string;
        };
        customer: {
          email: string;
        };
        metadata: {
          accessToken: string;
          accountReference: string;
        };
        reference: string;
      };
      event: string;
    } = req.body;

    if (body.event !== 'charge.success') {
      context.res = {
        body: true,
      };

      return;
    }

    let customer: ICustomer | null = await container.customerService.find(
      body.data.customer.email,
      AuthorizationHelper.getSub(body.data.metadata.accessToken)
    );

    if (customer) {
      const card: ICard | null =
        customer.cards.find(
          (x) =>
            x.bankIdentificationNumber === body.data.authorization.bin &&
            x.expirationMonth === body.data.authorization.exp_month &&
            x.expirationYear === body.data.authorization.exp_year &&
            x.last4Digits === body.data.authorization.last4
        ) || null;

      if (!card) {
        customer.cards.push(card);
      }
    } else {
      customer = {
        cards: [
          {
            authorizationCode: body.data.authorization.authorization_code,
            bankIdentificationNumber: body.data.authorization.bin,
            expirationMonth: body.data.authorization.exp_month,
            expirationYear: body.data.authorization.exp_year,
            last4Digits: body.data.authorization.last4,
          },
        ],
        emailAddress: body.data.customer.email,
        metadata: {},
        name: null,
      };
    }

    customer = await container.customerService.createOrUpdate(
      {
        cards: [
          {
            authorizationCode: body.data.authorization.authorization_code,
            bankIdentificationNumber: body.data.authorization.bin,
            expirationMonth: body.data.authorization.exp_month,
            expirationYear: body.data.authorization.exp_year,
            last4Digits: body.data.authorization.last4,
          },
        ],
        emailAddress: body.data.customer.email,
        metadata: {},
        name: null,
      },
      AuthorizationHelper.getSub(body.data.metadata.accessToken)
    );

    await container.transactionService.createProcessComplete(
      body.data.metadata.accountReference,
      body.data.amount,
      {
        authorizationCode: body.data.authorization.authorization_code,
        bankIdentificationNumber: body.data.authorization.bin,
        expirationMonth: body.data.authorization.exp_month,
        expirationYear: body.data.authorization.exp_year,
        last4Digits: body.data.authorization.last4,
      },
      body.data.reference,
      customer
        ? {
            emailAddress: customer.emailAddress,
            metadata: customer.metadata,
            name: customer.name,
          }
        : null,
      body.data.metadata,
      body.data.reference,
      'credit',
      AuthorizationHelper.getSub(body.data.metadata.accessToken)
    );

    context.res = {
      body: true,
    };
  } catch (error: any | unknown) {
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
