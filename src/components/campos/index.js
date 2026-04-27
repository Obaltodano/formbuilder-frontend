// src/components/campos/index.js

// --- INPUTS (Llenado) ---
import InputArchivo from './Archivo/InputArchivo.vue';
import InputCuadriculaMultiple from './CuadriculaMultiple/inputcuadriculaMultiple.vue';
import InputCuadriculaUnica from './CuadriculaUnica/inputcuadriculaUnica.vue';
import InputDropdown from './Dropdown/InputDropdown.vue';
import InputEmail from './Email/InputEmail.vue';
import InputEscala from './Escala/InputEscala.vue';
import InputFoto from './Foto/InputFoto.vue';
import InputGPS from './GPS/InputGPS.vue';
import InputMultiple from './Multiple/InputMultiple.vue'
import InputNumero from './Numero/InputNumero.vue';
import InputRadio from './Radio/InputRadio.vue';
import InputTextoCorto from './TextoCorto/InputTextoCorto.vue';
import InputTextoLargo from './TextoLargo/InputTextoLargo.vue';
import InputVideo from './Video/InputVideo.vue';

// --- CONFIGS (Constructor) ---
import ConfigArchivo from './Archivo/ConfigArchivo.vue';
import ConfigCuadriculaMultiple from './CuadriculaMultiple/ConfigcuadriculaMultiple.vue';
import ConfigCuadriculaUnica from './CuadriculaUnica/ConfigcuadriculaUnica.vue';
import ConfigDropdown from './Dropdown/ConfigDropdown.vue';
import ConfigEmail from './Email/ConfigEmail.vue';
import ConfigEscala from './Escala/ConfigEscala.vue';
import ConfigFoto from './Foto/ConfigFoto.vue';
import ConfigGPS from './GPS/ConfigGPS.vue';
import ConfigMultiple from './Multiple/ConfigMultiple.vue'
import ConfigNumero from './Numero/ConfigNumero.vue';
import ConfigRadio from './Radio/ConfigRadio.vue';
import ConfigTextoCorto from './TextoCorto/ConfigTextoCorto.vue';
import ConfigTextoLargo from './TextoLargo/ConfigTextoLargo.vue';
import ConfigVideo from './Video/ConfigVideo.vue';

// --- REPORTES (Resultados) ---
import ReporteArchivo from './Archivo/ReporteArchivo.vue';
import ReporteCuadriculaMultiple from './CuadriculaMultiple/ReportecuadriculaMultiple.vue';
import ReporteCuadriculaUnica from './CuadriculaUnica/ReportecuadriculaUnica.vue';
import ReporteDropdown from './Dropdown/ReporteDropdown.vue';
import ReporteEmail from './Email/ReporteEmail.vue';
import ReporteEscala from './Escala/ReporteEscala.vue';
import ReporteFoto from './Foto/ReporteFoto.vue';
import ReporteGPS from './GPS/ReporteGPS.vue';
import ReporteMultiple from './Multiple/ReporteMultiple.vue'
import ReporteNumero from './Numero/ReporteNumero.vue';
import ReporteRadio from './Radio/ReporteRadio.vue';
// CORREGIDO: Antes importaba ConfigTextoCorto aquí
import ReporteTextoCorto from './TextoCorto/ReporteTextoCorto.vue'; 
import ReporteTextoLargo from './TextoLargo/ReporteTextoLargo.vue';
import ReporteVideo from './Video/ReporteVideo.vue';

export {
    // Inputs
    InputArchivo, InputCuadriculaMultiple, InputGPS, InputCuadriculaUnica, InputDropdown,
    InputEmail, InputEscala, InputFoto, InputMultiple, InputNumero, InputRadio, 
    InputTextoCorto, InputTextoLargo, InputVideo,

    // Configs
    ConfigArchivo, ConfigCuadriculaMultiple, ConfigGPS, ConfigCuadriculaUnica, ConfigDropdown, 
    ConfigEmail, ConfigEscala, ConfigFoto, ConfigMultiple, ConfigNumero, ConfigRadio, 
    ConfigTextoCorto, ConfigTextoLargo, ConfigVideo,

    // Reportes
    ReporteArchivo, ReporteCuadriculaMultiple, ReporteGPS, ReporteCuadriculaUnica, 
    ReporteDropdown, ReporteEmail, ReporteEscala, ReporteFoto, ReporteMultiple, ReporteNumero, 
    ReporteRadio, ReporteTextoCorto, ReporteTextoLargo, ReporteVideo
};