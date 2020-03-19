import { Task, Glossary } from 'src/models'

export interface TransportLayer {
    requestNewTask(): Promise<Task>
    publishTask(task: Task): Promise<void>
    getGlossary(): Promise<Glossary>
}
