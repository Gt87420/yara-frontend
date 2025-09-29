export type ClimaActual = {
    descripcion: string;
    temperaturaActual: number;
    temperaturaMin: number;
    temperaturaMax: number;
    sensacionTermica: number;
    presion: number;
    humedad: number;
    vientoVelocidad: number;
    vientoDireccion: number;
    amanecer: string;
    atardecer: string;
    nube: number;
};

export type PronosticoItem = {
    fecha: string;
    descripcion: string;
    probabilidadLluvia: number;
    temp: number;
    tempMin: number;
    tempMax: number;
    vientoVelocidad: number;
    vientoDireccion: number;
    humedad: number;
};

export type ClimaResponse = {
    parcela: string;
    ubicacion: {
        lat: number;
        lng: number;
    };
    clima: ClimaActual;
    pronostico5Dias: PronosticoItem[];
};


export type RootStackParamList = {
    TestIcon: undefined;
    AgricultureCard: undefined;
    VistaPrincipal: undefined;
    Registro: undefined;
    Login: { google?: boolean };
    GoogleLogin: undefined;
    Home: undefined;
    Parcelas: undefined;
    CrearParcela: undefined;
    DetallesParcelaScreen: { parcela: any };
    Clima: { parcelaId: string };
    Cultivos: undefined;
    CrearCultivo: undefined;
    EditarCultivo: {
        id: string;
        onGoBack?: (cultivoActualizado: any) => void; // <-- agregar aquí
    };
    DetallesCultivo: { id: string };
    Insumos: undefined;
    InsumoDetail: { insumo: any };
    InsumoCreate: undefined;
    InsumoEdit: { id: string };
    ActividadesList: undefined;
    ActividadDetail: { id: string };
    ActividadCreate: undefined;
    ActividadEdit: { id: string };
}
