import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../tackyplates-backend/openapi.json',
  apiFile: './src/app/emptyApi.ts',
  apiImport: 'emptyExperimentsApi',
  outputFile: './src/app/experimentsApi.ts',
  exportName: 'experimentsApi',
  hooks: true,
}

export default config