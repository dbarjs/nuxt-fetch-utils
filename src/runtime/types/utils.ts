export interface BaseParamValues {
}

export type PathParamsWithOverrides<
  Path extends string,
  BaseParams extends Record<string, any> = BaseParamValues,
>
  = Path extends `${infer _}:${infer Param}/${infer Rest}`
  ? {
      [K in Param]: K extends keyof BaseParams ? BaseParams[K] : string;
    } & PathParamsWithOverrides<Rest, BaseParams>
    : Path extends `${infer _}:${infer Param}`
      ? {
          [K in Param]: K extends keyof BaseParams ? BaseParams[K] : string;
        }
      : Record<string, never>
