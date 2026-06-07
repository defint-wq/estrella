import { useMemo } from "react"
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"

export const useCreateAppRouter = () => {
    return useMemo(() => {
        return createBrowserRouter (
            createRoutesFromElements(
                <Route>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />}/>
                        <Route path="/patients" element={<PatientPage />}/>
                    </Route>
                </Route>
            )
        )
    }, [])
}