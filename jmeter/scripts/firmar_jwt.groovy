import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import groovy.json.JsonOutput

def encodeBase64Url(byte[] input) {
    return input.encodeBase64().toString()
        .replaceAll('=', '')
        .replaceAll('\\+', '-')
        .replaceAll('/', '_')
}

def generarJwt(Map payloadMap, String secretKey) {
    def header = [alg: "HS256", typ: "JWT"]
    def headerBase64 = encodeBase64Url(JsonOutput.toJson(header).getBytes("UTF-8"))
    def payloadBase64 = encodeBase64Url(JsonOutput.toJson(payloadMap).getBytes("UTF-8"))
    def contentToSign = "${headerBase64}.${payloadBase64}"
    
    Mac mac = Mac.getInstance("HmacSHA256")
    SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes("UTF-8"), "HmacSHA256")
    mac.init(secretKeySpec)
    def signatureBytes = mac.doFinal(contentToSign.getBytes("UTF-8"))
    def signatureBase64 = encodeBase64Url(signatureBytes)
    
    return "${contentToSign}.${signatureBase64}"
}

// Lee el secreto directamente desde las propiedades inyectadas por JMeter (-q)
def secret = props.get("JWT_SECRET") ?: System.getProperty("JWT_SECRET") ?: "secret_local"
long now = (long) (System.currentTimeMillis() / 1000)
long expValido = now + (8 * 3600)
long expVencido = now - 10

def pAdmin = [id: 1, role: "Administrador", nombre: "Admin", apellido: "QA", iat: now, exp: expValido]
def pTecnico = [id: 900001, role: "Técnico", nombre: "Tecnico", apellido: "QA", iat: now, exp: expValido]
def pCliente = [id: 900002, role: "Cliente", nombre: "Cliente", apellido: "QA", iat: now, exp: expValido]
def pExpirado = [id: 1, role: "Administrador", nombre: "Admin", apellido: "QA", iat: now - 100, exp: expVencido]

props.put("TOKEN_ADMIN", generarJwt(pAdmin, secret))
props.put("TOKEN_TECNICO", generarJwt(pTecnico, secret))
props.put("TOKEN_CLIENTE", generarJwt(pCliente, secret))
props.put("TOKEN_EXPIRADO", generarJwt(pExpirado, secret))
props.put("TOKEN_FIRMA_MAL", generarJwt(pAdmin, "clave_incorrecta_qa_123456"))

log.info("Tokens JWT firmados correctamente con el secreto del proyecto.")