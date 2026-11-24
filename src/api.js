import { supabase } from './supabaseClient'

// Elenco lezioni con posti liberi in un intervallo di date (formato AAAA-MM-GG)
export async function getLezioni(dataInizio, dataFine) {
    const { data, error } = await supabase.rpc('get_disponibilita_lezioni', {
        p_data_inizio: dataInizio,
        p_data_fine: dataFine,
    })
    if (error) throw new Error('Impossibile caricare le lezioni')
    return data
}

// Prenota un posto. Restituisce sempre { successo, codice, messaggio, prenotazione_id }
export async function prenotaLezione(lezioneId, nome, telefono) {
    const { data, error } = await supabase.rpc('prenota_lezione', {
        p_lezione_id: lezioneId,
        p_nome: nome,
        p_telefono: telefono,
    })
    if (error) {
        return {
            successo: false,
            codice: 'ERRORE_RETE',
            messaggio: 'Connessione non riuscita. Riprova.',
        }
    }
    return Array.isArray(data) ? data[0] : data
}