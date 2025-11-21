
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** Generic shape of an endpoint descriptor */
export type Endpoint<TType extends string, TMethod extends HttpMethod, TPath extends string, TReq, TRes> = {
	/** compile-time discriminator */
	type: TType
	/** HTTP verb */
	method: TMethod
	/** URL template, may contain `{placeholders}` */
	path: TPath
	/** body or query-string parameters */
	// request: TReq
	/** server payload */
	response: TRes
} & ([TReq] extends [void | undefined]
      ? { request?: TReq }                    //  ── GET /1.0/me
      : { request:  TReq })                  //  ── POST /search

export type AnyEndpoint = ParameterizedEndpoint<string, HttpMethod, string, unknown, unknown>


/* --------------------------------------------------------------- */
/*  A.  Extract the request payload from an arbitrary descriptor    */
/* --------------------------------------------------------------- */
type ExtractReq<T> = T extends { request: infer R } ? R : void

/* --------------------------------------------------------------- */
/*  B.  Build the final Endpoint<> signature from that descriptor  */
/* --------------------------------------------------------------- */
type EndpointFromSpec<T extends {
	type: string
	method: HttpMethod
	path: string
	response: any
	request?: any
}> = Endpoint<
	T['type'],
	T['method'],
	T['path'],
	ExtractReq<T>,          // ← request = void when key absent
	T['response']
>


// export function defineEndpoint<
//   TType   extends string,
//   TMethod extends HttpMethod,
//   TPath   extends string,
//   TReq,
//   TRes
// >(e: Endpoint<TType, TMethod, TPath, TReq, TRes>) {
//   return e
// }

export function defineEndpoint<T extends {
	type: string
	method: HttpMethod
	path: string
	response: any
	request?: any
}>(spec: T): EndpointFromSpec<T> {
	return spec as any
}



/** Recursively extract parameter placeholders,
 * e.g. path = '/user/{id}/foo/{bar}' yields type 'id' | 'bar'
 */
type PathParams<S extends string> =
	S extends `${infer _Start}{${infer P}}${infer Rest}`
	? P | PathParams<Rest>
	: never

/** Turns '/user/{id}/{slug}' into { id: string; slug: string }
    If the path has *no* placeholders the result is `undefined`. */
type PathParamObject<P extends string> =
	[PathParams<P>] extends [never]
	? undefined
	: { [K in PathParams<P>]: string }

/** forces path placeholders to be present in Req */
type ParameterizedRequest<TPath, Req> = TPath extends `${string}{${string}}${string}`
	? { [K in PathParams<TPath>]: string } & Req
	: Req

type ParameterizedEndpoint<TType extends string, TMethod extends HttpMethod, TPath extends string, Req, Res> =
	Endpoint<TType, TMethod, TPath, ParameterizedRequest<TPath, Req>, Res>


// const aPath = '/user/{id}/foo/{bar}' as const
// const bPath = '/user/go/foo' as const
// type AParams = PathParams<typeof aPath>
// type ANoParams = PathParams<typeof bPath>
// type AParamsObj = PathParamObject<typeof aPath>
// type ARequest = ParameterizedRequest<typeof aPath, { bonus: number }>
