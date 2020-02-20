import { useMemo } from 'react'
import { useFetch } from 'use-http'
import { ParagraphJSON, decodeParagraph } from 'src/models'

export const useSample = (id: string) => {
    const audio = `/samples/${id}/${id}.wav`
    const { loading, data } = useFetch<ParagraphJSON[]>(`/samples/${id}/${id}_depo_utts.json`, {}, [])

    const paragraphs = useMemo(() => {
        if (data) {
            return data.map(decodeParagraph)
        } else {
            return null
        }
    }, [data])

    return {
        loading,
        paragraphs,
        audio,
    }
}
