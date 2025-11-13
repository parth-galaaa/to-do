export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

// Define the Database interface representing the structure of your Supabase database
export interface Database {
	// Define the public schema
	public: {
		// Define the Tables in the public schema
		Tables: {
			// Define the lists table
			lists: {
				Row: {
					id: string
					user_id: string
					name: string
					type: 'tasks' | 'grocery' | 'shopping' | 'custom'
					color: string
					icon: string
					requires_priority: boolean
					requires_due_date: boolean
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					user_id: string
					name: string
					type: 'tasks' | 'grocery' | 'shopping' | 'custom'
					color?: string
					icon?: string
					requires_priority?: boolean
					requires_due_date?: boolean
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					user_id?: string
					name?: string
					type?: 'tasks' | 'grocery' | 'shopping' | 'custom'
					color?: string
					icon?: string
					requires_priority?: boolean
					requires_due_date?: boolean
					created_at?: string
					updated_at?: string
				}
			}
			// Define the todos table
			todos: {
				// Define the structure of a row in the todos table
				Row: {
					id: string
					user_id: string
					list_id: string | null
					title: string
					description: string | null
					completed: boolean
					priority: 'low' | 'medium' | 'high' | null
					due_date: string | null
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					user_id: string
					list_id?: string | null
					title: string
					description?: string | null
					completed?: boolean
					priority?: 'low' | 'medium' | 'high' | null
					due_date?: string | null
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					user_id?: string
					list_id?: string | null
					title?: string
					description?: string | null
					completed?: boolean
					priority?: 'low' | 'medium' | 'high' | null
					due_date?: string | null
					created_at?: string
					updated_at?: string
				}
			}
		}
	}
}

// Export types for easier usage in other parts of the application
export type List = Database['public']['Tables']['lists']['Row']
export type ListInsert = Database['public']['Tables']['lists']['Insert']
export type ListUpdate = Database['public']['Tables']['lists']['Update']

export type Todo = Database['public']['Tables']['todos']['Row']
export type TodoInsert = Database['public']['Tables']['todos']['Insert']
export type TodoUpdate = Database['public']['Tables']['todos']['Update']