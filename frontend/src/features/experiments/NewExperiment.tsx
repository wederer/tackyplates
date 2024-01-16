import { useTackyplatesUrlsGetSettingsQuery } from "../../app/experimentsApi";
import { CircularProgress, Typography } from "@mui/material";
import NewWizard from "./NewWizard";
import { clientLog } from '../../app/logging';

function NewExperiment() {
    const { data: settings, error: settingsError, isLoading: settingsLoading } = useTackyplatesUrlsGetSettingsQuery()

    if(settingsLoading){
        return <CircularProgress />
    }

    if(settingsError || !settings) {
        clientLog('Error loading settings', settingsError, settings)
        return (<Typography variant="h4">Ein Fehler beim Laden der Settings ist vorgefallen - bitte erneut versuchen.</Typography>)
    }

    return (
        <NewWizard settings={settings}></NewWizard>
    )
}

export default NewExperiment