import { Builder, By, until } from 'selenium-webdriver';

// Módulo de prueba para el inicio de sesión

/**
 * Inicio de sesión exitoso rol administrador
 */
(async function testLogin() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:3000/');
        await driver.wait(until.elementLocated(By.name('usuario')), 40000);
        await driver.findElement(By.name('usuario')).sendKeys('kevin@gmail.com');
        await driver.findElement(By.name('contrasena')).sendKeys('12345678');
        await driver.findElement(By.css('button.button')).click();
        await driver.wait(until.urlIs('http://localhost:3000/panel/dashboard'), 40000);
        console.log('Inicio de sesión exitoso');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    } finally {
        await driver.quit();
    }
})();
