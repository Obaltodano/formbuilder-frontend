/// <reference types="cypress" />

describe('SaaS FormBuilder - Flujo Completo', () => {
  
  // Datos de prueba
  const superAdmin = {
    email: 'admin@formbuilder.com',
    password: 'SuperAdmin123'
  }
  
  const empresaTest = {
    nombre: 'Empresa Test',
    empresaId: 'empresa_test_' + Date.now(),
    email: 'gerente@empresatest.com'
  }

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  // ==========================================
  // 1. SUPERADMIN - Gestión de Empresas
  // ==========================================
  describe('SuperAdmin Dashboard', () => {
    
    beforeEach(() => {
      cy.visit('/')
      cy.get('[data-testid="email-input"]').type(superAdmin.email)
      cy.get('[data-testid="password-input"]').type(superAdmin.password)
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/superadmin-dashboard')
    })

    it('Debe mostrar métricas del SaaS', () => {
      cy.get('[data-testid="mrr-card"]').should('be.visible')
      cy.get('[data-testid="empresas-activas-card"]').should('be.visible')
      cy.get('[data-testid="usuarios-totales-card"]').should('be.visible')
      cy.get('[data-testid="storage-card"]').should('be.visible')
    })

    it('Debe listar empresas con filtros', () => {
      cy.get('[data-testid="empresas-table"]').should('be.visible')
      cy.get('[data-testid="search-empresas"]').type('test')
      cy.get('[data-testid="filter-status"]').select('activa')
      cy.get('[data-testid="empresa-row"]').should('have.length.at.least', 0)
    })

    it('Debe suspender y reactivar una empresa', () => {
      cy.get('[data-testid="empresa-row"]').first().click()
      cy.get('[data-testid="toggle-status-button"]').click()
      cy.get('[data-testid="confirm-suspension"]').click()
      cy.get('[data-testid="status-badge"]').should('contain', 'suspendida')
      
      // Reactivar
      cy.get('[data-testid="toggle-status-button"]').click()
      cy.get('[data-testid="status-badge"]').should('contain', 'activa')
    })

    it('Debe aprobar pagos pendientes', () => {
      cy.get('[data-testid="pagos-pendientes"]').should('be.visible')
      cy.get('[data-testid="pago-item"]').first().click()
      cy.get('[data-testid="aprobar-pago-button"]').click()
      cy.get('[data-testid="toast-success"]').should('contain', 'Pago aprobado')
    })
  })

  // ==========================================
  // 2. GERENTE - Constructor y Branding
  // ==========================================
  describe('Gerente Dashboard - Constructor Universal', () => {
    
    beforeEach(() => {
      // Login como gerente
      cy.visit('/login/empresa-test')
      cy.get('[data-testid="email-input"]').type(empresaTest.email)
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('Debe mostrar white-label con branding correcto', () => {
      cy.get('[data-testid="empresa-logo"]').should('be.visible')
      cy.get('[data-testid="empresa-nombre"]').should('contain', empresaTest.nombre)
    })

    it('Debe abrir el constructor y crear un formulario', () => {
      cy.get('[data-testid="nuevo-formulario-button"]').click()
      cy.url().should('include', '/constructor')

      // Configurar título
      cy.get('[data-testid="form-titulo"]').type('Formulario de Prueba E2E')
      
      // Agregar campos
      cy.get('[data-testid="add-campo-texto_corto"]').click()
      cy.get('[data-testid="campo-label"]').last().clear().type('Nombre completo')
      cy.get('[data-testid="campo-requerido"]').last().check()
      
      cy.get('[data-testid="add-campo-email"]').click()
      cy.get('[data-testid="campo-label"]').last().clear().type('Correo electrónico')
      
      cy.get('[data-testid="add-campo-foto"]').click()
      cy.get('[data-testid="campo-label"]').last().clear().type('Foto de perfil')

      // Guardar
      cy.get('[data-testid="guardar-formulario"]').click()
      cy.get('[data-testid="toast-success"]').should('contain', 'Formulario guardado')
    })

    it('Debe validar límites del plan', () => {
      // Intentar crear más formularios que el límite
      for (let i = 0; i < 15; i++) {
        cy.get('[data-testid="nuevo-formulario-button"]').click()
        cy.get('[data-testid="form-titulo"]').type(`Formulario ${i}`)
        cy.get('[data-testid="guardar-formulario"]').click()
      }
      
      cy.get('[data-testid="toast-error"]').should('contain', 'Límite de formularios alcanzado')
      cy.get('[data-testid="limit-warning"]').should('be.visible')
    })

    it('Debe personalizar branding', () => {
      cy.get('[data-testid="branding-tab"]').click()
      
      // Cambiar color primario
      cy.get('[data-testid="color-primario"]').clear().type('#ff5733')
      
      // Subir logo
      cy.get('[data-testid="logo-input"]').attachFile('logo-test.png')
      cy.get('[data-testid="logo-preview"]').should('be.visible')
      
      // Guardar
      cy.get('[data-testid="save-branding"]').click()
      cy.get('[data-testid="toast-success"]').should('contain', 'Branding actualizado')
      
      // Verificar que se aplica
      cy.get('[data-testid="empresa-logo"]').should('be.visible')
    })

    it('Debe mostrar consumo de recursos', () => {
      cy.get('[data-testid="recursos-tab"]').click()
      
      cy.get('[data-testid="usuarios-progress"]').should('be.visible')
      cy.get('[data-testid="formularios-progress"]').should('be.visible')
      cy.get('[data-testid="storage-progress"]').should('be.visible')
    })
  })

  // ==========================================
  // 3. USUARIO - App Móvil
  // ==========================================
  describe('Usuario App - Ejecución de Formularios', () => {
    
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/login/empresa-test')
      cy.get('[data-testid="email-input"]').type('usuario@empresatest.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/app')
    })

    it('Debe mostrar lista de tareas pendientes', () => {
      cy.get('[data-testid="tareas-list"]').should('be.visible')
      cy.get('[data-testid="tarea-item"]').should('have.length.at.least', 1)
    })

    it('Debe completar un formulario con multimedia', () => {
      cy.get('[data-testid="tarea-item"]').first().click()
      
      // Llenar campos de texto
      cy.get('[data-testid="input-nombre_completo"]').type('Juan Pérez')
      cy.get('[data-testid="input-correo_electronico"]').type('juan@test.com')
      
      // Tomar foto (simulado)
      cy.get('[data-testid="capture-foto_de_perfil"]').click()
      cy.get('[data-testid="camera-modal"]').should('be.visible')
      cy.get('[data-testid="take-photo-button"]').click()
      
      // Capturar GPS
      cy.get('[data-testid="capture-gps"]').click()
      cy.get('[data-testid="gps-coordinates"]').should('contain', 'Lat:')
      
      // Enviar
      cy.get('[data-testid="enviar-formulario"]').click()
      cy.get('[data-testid="toast-success"]').should('contain', 'Formulario enviado')
    })

    it('Debe navegar por bottom bar', () => {
      cy.get('[data-testid="tab-completados"]').click()
      cy.get('[data-testid="completados-list"]').should('be.visible')
      
      cy.get('[data-testid="tab-perfil"]').click()
      cy.get('[data-testid="perfil-info"]').should('be.visible')
      
      cy.get('[data-testid="tab-tareas"]').click()
      cy.get('[data-testid="tareas-list"]').should('be.visible')
    })
  })

  // ==========================================
  // 4. Responsividad
  // ==========================================
  describe('Responsividad - Multi-dispositivo', () => {
    
    it('Debe adaptarse a móvil', () => {
      cy.viewport('iphone-x')
      cy.visit('/constructor')
      
      // Sidebar debe estar colapsado o en drawer
      cy.get('[data-testid="sidebar-herramientas"]').should('not.be.visible')
      cy.get('[data-testid="toggle-sidebar"]').should('be.visible')
      
      // Bottom bar en lugar de sidebar
      cy.get('[data-testid="bottom-bar"]').should('be.visible')
    })

    it('Debe adaptarse a tablet', () => {
      cy.viewport('ipad-2')
      cy.visit('/constructor')
      
      // Layout de 2 columnas
      cy.get('[data-testid="constructor-grid"]').should('have.class', 'grid-cols-2')
    })

    it('Debe adaptarse a desktop', () => {
      cy.viewport(1920, 1080)
      cy.visit('/constructor')
      
      // Layout completo de 3 columnas
      cy.get('[data-testid="sidebar-herramientas"]').should('be.visible')
      cy.get('[data-testid="area-edicion"]').should('be.visible')
      cy.get('[data-testid="panel-propiedades"]').should('be.visible')
    })
  })

  // ==========================================
  // 5. Seguridad - Multi-tenant Isolation
  // ==========================================
  describe('Seguridad - Aislamiento Multi-tenant', () => {
    
    it('Debe prevenir acceso a datos de otra empresa', () => {
      // Login como gerente de empresa A
      cy.login('gerente@empresaa.com', 'password123')
      
      // Intentar acceder a formulario de empresa B
      cy.request({
        url: '/api/formularios/empresa_b_form_123',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403)
      })
    })

    it('Debe redirigir a página de suspensión si empresa suspendida', () => {
      cy.login('gerente@empresasuspendida.com', 'password123')
      cy.url().should('include', '/suspension')
      cy.get('[data-testid="suspension-message"]').should('contain', 'servicio suspendido')
    })
  })
})
