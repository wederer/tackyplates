export function clientLog(message?: any, ...optionalParams: any[]) {
  const loggingEnabled = localStorage.getItem("tackyLogging") !== null
  loggingEnabled && console.log(message, optionalParams)
}