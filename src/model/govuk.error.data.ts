// Used by the Gov.uk nunjucks components to extract
// validation error messages

export interface GovUkErrorData {
  href: string;
  flag: boolean;
  text: string;
  type: string;
}

export let createGovUkErrorData = (errorText: string,
                                   errorHref: string,
                                   errorFlag: boolean,
                                   errorType: string): GovUkErrorData => {
  return {
    flag: errorFlag,
    href: errorHref,
    text: errorText,
    type: errorType,
  };
};
