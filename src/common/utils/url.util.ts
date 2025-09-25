import { compile, ParseOptions } from 'path-to-regexp';

type UrlParams = Record<string, string | string[]>;
export interface FormatUrlOptions {
  path?: UrlParams;
  query?: UrlParams;
}

export const formatUrl = (url: string, options?: FormatUrlOptions): string => {
  return formatUrlQuery(formatUrlPath(url, options?.path), options?.query);
};

export const formatUrlPath = (url: string, params?: UrlParams | null): string => {
  if (!params) {
    return url;
  }

  const toPath = compile(url, { encode: encodeURIComponent } as ParseOptions);
  return toPath(params);
};

export const formatUrlQuery = (url: string, params?: UrlParams | null): string => {
  if (!params) {
    return url;
  }

  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;

  for (const key in params) {
    if (params[key] !== undefined) {
      searchParams.set(key, params[key].toString());
    }
  }

  return String(urlObj);
};
