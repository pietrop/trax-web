import { Task, Glossary, WorkerId, SessionStatus } from 'src/models'

export interface TransportLayer {
    authenticate(taskTypes?: string[]): Promise<WorkerId>
    getSessionStatus(workerId: WorkerId): Promise<SessionStatus>
    requestNewTask(workerId: WorkerId): Promise<Task>
    publishTask(task: Task, data: any, workerId: WorkerId): Promise<void>
    getGlossary(): Promise<Glossary>
}
