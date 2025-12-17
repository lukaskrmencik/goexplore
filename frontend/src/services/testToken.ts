import apiClient from "./apiClient";

export const testToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.post("/login", {
      email: "krmencik.lukas@gmail.com",
      password: "Sumec184"
    });
    
    const token = response.data.data.token;
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token uložen do localStorage:", token);
      return token;
    } else {
      console.error("Token nebyl vrácen");
      return null;
    }
  } catch (err) {
    console.error("Chyba při testovém loginu:", err);
    return null;
  }
};