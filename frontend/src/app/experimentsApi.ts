import { emptyExperimentsApi as api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    tackyplatesUrlsCreateExperiment: build.mutation<
      TackyplatesUrlsCreateExperimentApiResponse,
      TackyplatesUrlsCreateExperimentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/experiments`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    tackyplatesUrlsGetExperiments: build.query<
      TackyplatesUrlsGetExperimentsApiResponse,
      TackyplatesUrlsGetExperimentsApiArg
    >({
      query: () => ({ url: `/api/experiments` }),
    }),
    tackyplatesUrlsStartExperiment: build.mutation<
      TackyplatesUrlsStartExperimentApiResponse,
      TackyplatesUrlsStartExperimentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/experiment/${queryArg.experimentId}`,
        method: "POST",
      }),
    }),
    tackyplatesUrlsUpdateExperiment: build.mutation<
      TackyplatesUrlsUpdateExperimentApiResponse,
      TackyplatesUrlsUpdateExperimentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/experiments/${queryArg.experimentId}`,
        method: "PUT",
        body: queryArg.experimentSchema,
      }),
    }),
    tackyplatesUrlsGetExperiment: build.query<
      TackyplatesUrlsGetExperimentApiResponse,
      TackyplatesUrlsGetExperimentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/experiments/${queryArg.experimentId}`,
      }),
    }),
    tackyplatesUrlsGetProgress: build.query<
      TackyplatesUrlsGetProgressApiResponse,
      TackyplatesUrlsGetProgressApiArg
    >({
      query: () => ({ url: `/api/progress` }),
    }),
    tackyplatesUrlsGetNewAllowed: build.query<
      TackyplatesUrlsGetNewAllowedApiResponse,
      TackyplatesUrlsGetNewAllowedApiArg
    >({
      query: () => ({ url: `/api/new_allowed` }),
    }),
    tackyplatesUrlsGetRunningExperiments: build.query<
      TackyplatesUrlsGetRunningExperimentsApiResponse,
      TackyplatesUrlsGetRunningExperimentsApiArg
    >({
      query: () => ({ url: `/api/running_experiments` }),
    }),
    tackyplatesUrlsExcelExport: build.mutation<
      TackyplatesUrlsExcelExportApiResponse,
      TackyplatesUrlsExcelExportApiArg
    >({
      query: (queryArg) => ({
        url: `/api/excel_export/${queryArg.experimentIds}`,
        method: "POST",
      }),
    }),
    tackyplatesUrlsGoto: build.mutation<
      TackyplatesUrlsGotoApiResponse,
      TackyplatesUrlsGotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/goto`,
        method: "POST",
        params: { position: queryArg.position },
      }),
    }),
    tackyplatesUrlsDropBall: build.mutation<
      TackyplatesUrlsDropBallApiResponse,
      TackyplatesUrlsDropBallApiArg
    >({
      query: () => ({ url: `/api/ball`, method: "POST" }),
    }),
    tackyplatesUrlsMoveBallguide: build.mutation<
      TackyplatesUrlsMoveBallguideApiResponse,
      TackyplatesUrlsMoveBallguideApiArg
    >({
      query: (queryArg) => ({
        url: `/api/ballguide`,
        method: "POST",
        params: { position: queryArg.position },
      }),
    }),
    tackyplatesUrlsMeasure: build.mutation<
      TackyplatesUrlsMeasureApiResponse,
      TackyplatesUrlsMeasureApiArg
    >({
      query: () => ({ url: `/api/measure`, method: "POST" }),
    }),
    tackyplatesUrlsGetSettings: build.query<
      TackyplatesUrlsGetSettingsApiResponse,
      TackyplatesUrlsGetSettingsApiArg
    >({
      query: () => ({ url: `/api/settings` }),
    }),
    tackyplatesUrlsHeartbeat: build.query<
      TackyplatesUrlsHeartbeatApiResponse,
      TackyplatesUrlsHeartbeatApiArg
    >({
      query: () => ({ url: `/api/heartbeat` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as experimentsApi };
export type TackyplatesUrlsCreateExperimentApiResponse =
  /** status 200 OK */ ExperimentSchema[];
export type TackyplatesUrlsCreateExperimentApiArg = {
  body: ExperimentIn[];
};
export type TackyplatesUrlsGetExperimentsApiResponse =
  /** status 200 OK */ ExperimentOut[];
export type TackyplatesUrlsGetExperimentsApiArg = void;
export type TackyplatesUrlsStartExperimentApiResponse =
  /** status 200 OK */ undefined;
export type TackyplatesUrlsStartExperimentApiArg = {
  experimentId: number;
};
export type TackyplatesUrlsUpdateExperimentApiResponse =
  /** status 200 OK */ ExperimentSchema;
export type TackyplatesUrlsUpdateExperimentApiArg = {
  experimentId: number;
  experimentSchema: ExperimentSchema;
};
export type TackyplatesUrlsGetExperimentApiResponse =
  /** status 200 OK */ ExperimentOut;
export type TackyplatesUrlsGetExperimentApiArg = {
  experimentId: number;
};
export type TackyplatesUrlsGetProgressApiResponse =
  /** status 200 OK */ ExpWithProgress[];
export type TackyplatesUrlsGetProgressApiArg = void;
export type TackyplatesUrlsGetNewAllowedApiResponse =
  /** status 200 OK */ boolean;
export type TackyplatesUrlsGetNewAllowedApiArg = void;
export type TackyplatesUrlsGetRunningExperimentsApiResponse =
  /** status 200 OK */ ExperimentOut[];
export type TackyplatesUrlsGetRunningExperimentsApiArg = void;
export type TackyplatesUrlsExcelExportApiResponse = /** status 200 OK */ string;
export type TackyplatesUrlsExcelExportApiArg = {
  experimentIds: string;
};
export type TackyplatesUrlsGotoApiResponse = unknown;
export type TackyplatesUrlsGotoApiArg = {
  position: number;
};
export type TackyplatesUrlsDropBallApiResponse = unknown;
export type TackyplatesUrlsDropBallApiArg = void;
export type TackyplatesUrlsMoveBallguideApiResponse = unknown;
export type TackyplatesUrlsMoveBallguideApiArg = {
  position: number;
};
export type TackyplatesUrlsMeasureApiResponse = /** status 200 OK */ number;
export type TackyplatesUrlsMeasureApiArg = void;
export type TackyplatesUrlsGetSettingsApiResponse =
  /** status 200 OK */ SettingOut;
export type TackyplatesUrlsGetSettingsApiArg = void;
export type TackyplatesUrlsHeartbeatApiResponse = /** status 200 OK */ string;
export type TackyplatesUrlsHeartbeatApiArg = void;
export type ExperimentSchema = {
  id?: number;
  created_on: string;
  modified_on: string;
  project_id: string;
  sample_id: string;
  started_on?: string;
  comment?: string;
  start_distance: number;
  end_distance: number;
  measurement_times?: number[];
};
export type Message = {
  message: string;
};
export type ExperimentIn = {
  project_id: string;
  sample_id: string;
  comment: string;
  start_distance: number;
  end_distance: number;
  measurement_times: number[];
};
export type MeasurementOut = {
  id: number;
  created_on: string;
  value: number;
};
export type ExperimentOut = {
  id: number;
  created_on: string;
  started_on?: string;
  project_id: string;
  sample_id: string;
  comment: string;
  start_distance: number;
  end_distance: number;
  measurements: MeasurementOut[];
  measurement_times: number[];
};
export type ExpWithProgress = {
  id: number;
  created_on: string;
  started_on?: string;
  project_id: string;
  sample_id: string;
  comment: string;
  start_distance: number;
  end_distance: number;
  measurements: MeasurementOut[];
  measurement_times: number[];
  progress?: number;
};
export type SettingOut = {
  board_width: number;
  ball_diameter: number;
  experiment_gap: number;
  measurement_gap: number;
};
export const {
  useTackyplatesUrlsCreateExperimentMutation,
  useTackyplatesUrlsGetExperimentsQuery,
  useTackyplatesUrlsStartExperimentMutation,
  useTackyplatesUrlsUpdateExperimentMutation,
  useTackyplatesUrlsGetExperimentQuery,
  useTackyplatesUrlsGetProgressQuery,
  useTackyplatesUrlsGetNewAllowedQuery,
  useTackyplatesUrlsGetRunningExperimentsQuery,
  useTackyplatesUrlsExcelExportMutation,
  useTackyplatesUrlsGotoMutation,
  useTackyplatesUrlsDropBallMutation,
  useTackyplatesUrlsMoveBallguideMutation,
  useTackyplatesUrlsMeasureMutation,
  useTackyplatesUrlsGetSettingsQuery,
  useTackyplatesUrlsHeartbeatQuery,
} = injectedRtkApi;
