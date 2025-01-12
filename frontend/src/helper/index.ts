const removeQueryParam = (param: string) => {
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.delete(param);

  return searchParams;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export { removeQueryParam, delay };
