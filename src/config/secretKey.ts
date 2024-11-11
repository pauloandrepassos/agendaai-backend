const secretKey = process.env.SECRET_KEY

if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in environment variables");
}

export default secretKey