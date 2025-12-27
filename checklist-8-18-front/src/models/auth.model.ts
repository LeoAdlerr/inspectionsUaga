/**
 * Representa o objeto de usuário completo, como retornado pela API
 * ao criar ou buscar um usuário.
 */
export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  isActive: boolean;
  roles: { id: number; name: string }[]; // Adicionado 'name' para maior utilidade no frontend
}

/**
 * Representa o payload de dados que está DENTRO do JWT (access_token).
 * Obteremos isso decodificando o token após o login.
 */
export interface DecodedToken {
  sub: number; // Subject, que é o ID do usuário
  username: string;
  roles: string[]; // Ex: ["INSPECTOR", "ADMIN"]
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
}

/**
 * A forma do nosso estado de autenticação que será salvo na store do Pinia.
 */
export interface AuthState {
  token: string | null;
  user: {
    id: number;
    username: string;
    roles: string[];
  } | null;
}

// ===================================================================
// DTOs (Data Transfer Objects) para Comunicação com a API
// ===================================================================

/**
 * Dados necessários para a requisição de login.
 */
export interface LoginCredentials {
  loginIdentifier: string; // Pode ser 'username' ou 'email'
  password: string;
}

/**
 * A resposta da API de login.
 */
export interface LoginResponse {
  access_token: string;
}

/**
 * Dados necessários para criar um novo usuário.
 */
export interface CreateUserDto {
  fullName: string;
  username: string;
  email: string;
  password: string;
  roleIds: number[];
}

/**
 * Dados para atualizar um usuário. Todos os campos são opcionais.
 */
export interface UpdateUserDto {
  fullName?: string;
  username?: string;
  email?: string;
  isActive?: boolean;
  roleIds?: number[];
}

/**
 * Dados para o usuário logado alterar a própria senha.
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * Dados para um Admin redefinir a senha de outro usuário.
 */
export interface ResetPasswordDto {
  newPassword: string;
}