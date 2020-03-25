import { Task, Glossary, WorkerId } from 'src/models'

export interface TransportLayer {
    authenticate(taskTypes?: string[]): Promise<WorkerId>
    requestNewTask(workerId: WorkerId): Promise<Task>
    publishTask(task: Task, workerId: WorkerId): Promise<void>
    getGlossary(): Promise<Glossary>
}
