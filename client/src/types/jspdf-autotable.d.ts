
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable: {
            finalY: number;
        };
    }
}

declare module 'jspdf-autotable' {
    // Este módulo extiende jsPDF con la funcionalidad autoTable
}
