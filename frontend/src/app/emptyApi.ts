// Or from '@reduxjs/toolkit/query' if not using the auto-generated hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Um IP Adresse upzudaten:
 * --> ./build.sh ausführen
 */
export const emptyExperimentsApi = createApi({
  baseQuery: fetchBaseQuery({baseUrl: process.env.REACT_APP_TACKY_URL}),


  /** old **/
  // labor
  // baseQuery: fetchBaseQuery({ baseUrl: 'http://10.112.162.70:8000/' }),
  // sonstiges
  // baseQuery: fetchBaseQuery({ baseUrl: 'http://192.168.2.113:8000/' }),
  // baseQuery: fetchBaseQuery({baseUrl: 'http://192.168.1.50:8000/'}),
  endpoints: () => ({}),
})
