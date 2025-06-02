
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API_URL } from '@/config';

// Ejemplo de cómo usar las notificaciones en cualquier componente
export const NotificationExample = () => {
    const { showSuccess, showError } = useNotifications();
    const queryClient = useQueryClient();

    // Ejemplo de mutación para crear algo
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return axios.post(`${API_URL}/api/ejemplo`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo'] });
            showSuccess('Elemento creado correctamente');
        },
        onError: (error) => {
            showError(error, 'No se pudo crear el elemento');
        },
    });

    // Ejemplo de mutación para actualizar algo
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            return axios.put(`${API_URL}/api/ejemplo/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo'] });
            showSuccess('Elemento actualizado correctamente');
        },
        onError: (error) => {
            showError(error, 'No se pudo actualizar el elemento');
        },
    });

    // Ejemplo de mutación para eliminar algo
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return axios.delete(`${API_URL}/api/ejemplo/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ejemplo'] });
            showSuccess('Elemento eliminado correctamente');
        },
        onError: (error) => {
            showError(error, 'No se pudo eliminar el elemento');
        },
    });

    return (
        <div className="space-y-4">
            <Button
                onClick={() => createMutation.mutate({ nombre: 'Test' })}
                disabled={createMutation.isPending}
            >
                {createMutation.isPending ? 'Creando...' : 'Crear'}
            </Button>

            <Button
                onClick={() => updateMutation.mutate({ id: 1, data: { nombre: 'Test Updated' } })}
                disabled={updateMutation.isPending}
            >
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>

            <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(1)}
                disabled={deleteMutation.isPending}
            >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
        </div>
    );
};
