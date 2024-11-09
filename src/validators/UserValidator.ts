class UserValidator {
    static validateRegisterFields(name: string, cpf: string, email: string, password: string, phone: string) {
        if (!name || name.trim() === "") {
            throw new Error("Name cannot be empty");
        }
        if (!cpf || cpf.trim() === "") {
            throw new Error("CPF cannot be empty");
        }
        if (!email || email.trim() === "") {
            throw new Error("Email cannot be empty");
        }
        if (!password || password.trim() === "") {
            throw new Error("Password cannot be empty");
        }
        if (!phone || phone.trim() === "") {
            throw new Error("Phone cannot be empty");
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new Error("Email format is invalid");
        }

        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (!cpfRegex.test(cpf)) {
            throw new Error("CPF format is invalid. Example: 123.456.789-01");
        }

        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
    }
}

export default UserValidator;
