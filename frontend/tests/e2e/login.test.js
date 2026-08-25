import { test, expect } from '@playwright/test';

// modulo gestión de usuarios
test.describe("modulo de login", () => {
    test("Debe permitir iniciar sesión con credenciales válidas", async ({page}) => {
        await page.goto("http://localhost:3000/");
        await page.locator('input[name="usuario"]').fill('kevin@gmail.com');
        await page.locator('input[name="contrasena"]').fill('12345678');
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
        await expect(page).toHaveURL("http://localhost:3000/panel/dashboard");
    })
});


test.describe("modulo de login", () => {
    test("Debe rechazar iniciar sesión con credenciales inválidas", async ({page}) => {
        await page.goto("http://localhost:3000/");
        await page.locator('input[name="usuario"]').fill('carlos@gmail.com');
        await page.locator('input[name="contrasena"]').fill('12345678');
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
        await expect(page).toHaveURL("http://localhost:3000/panel/dashboard");
    })
});


