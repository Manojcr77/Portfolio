const router = require("express").Router()
const { login, adminLogin, changePassword } = require("../controllers/authController")
const auth = require("../middleware/auth")

router.post("/login",          login)
router.post("/admin-login",    adminLogin)
router.put("/change-password", auth, changePassword)

module.exports = router