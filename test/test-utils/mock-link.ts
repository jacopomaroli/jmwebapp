import { ExecutionResult, print } from 'graphql';
import { ApolloLink, Observable, Operation, NextLink } from 'apollo-link'

export function mockLink(): ApolloLink {
  return new MockLink()
}

export interface MockedResponse {
  request: Operation;
  result: ExecutionResult;
  error?: Error;
  delay?: number;
}

export class MockLink extends ApolloLink {
  private mockedResponsesByKey: { [key: string]: MockedResponse[] } = {};

  constructor() {
    super()
  }

  public addMockedResponse(mockedResponse: MockedResponse) {
    const key = requestToKey(mockedResponse.request);
    let mockedResponses = this.mockedResponsesByKey[key];
    if (!mockedResponses) {
      mockedResponses = [];
      this.mockedResponsesByKey[key] = mockedResponses;
    }
    mockedResponses.push(mockedResponse);
  }

  public flushMockedResponses() {
    this.mockedResponsesByKey = {};
  }

  public request(operation: Operation, forward?: NextLink) {
    const self = this
    return new Observable(observer => {
      const key = requestToKey(operation);
      const responses = self.mockedResponsesByKey[key];
      if (!responses || responses.length === 0) {
        throw new Error(`No more mocked responses for the query: ${print(operation.query)}, variables: ${JSON.stringify(operation.variables)}`);
      }

      const res: MockedResponse = responses.shift()!;

      if (!res.result && !res.error) {
        throw new Error(`Mocked response should contain either result or error: ${key}`);
      }

      sleep(res.delay)
        .then(() => {
          observer.next(res.result)
          observer.complete()
        })
        .catch(observer.error.bind(observer))
    })
  }
}

function requestToKey(request: Operation): string {
  const queryString = request.query && print(request.query);

  return JSON.stringify({
    variables: request.variables || {},
    query: queryString,
  });
}

function sleep (ms: number | undefined) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
