import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExecuteToolRequest {
  agentId: string
  userId: string
  toolName: string
  parameters: Record<string, any>
  endpoint?: string
}

interface ExecuteToolResponse {
  success: boolean
  result?: any
  error?: string
  execution_time_ms: number
  details: {
    agent_id: string
    tool_name: string
    parameters: Record<string, any>
    timestamp: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { agentId, userId, toolName, parameters, endpoint }: ExecuteToolRequest = await req.json()

    if (!agentId || !userId || !toolName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, userId, toolName' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify user has access to this agent
    const { data: userAgent, error: userAgentError } = await supabaseClient
      .from('user_agents')
      .select('*, agents(*)')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .eq('status', 'connected')
      .single()

    if (userAgentError || !userAgent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found or not connected' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify tool exists in agent's capabilities
    const agent = userAgent.agents
    const tools = agent.tools || []
    const tool = tools.find((t: any) => t.name === toolName)

    if (!tool) {
      return new Response(
        JSON.stringify({ error: `Tool '${toolName}' not found in agent capabilities` }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Execute tool
    const startTime = performance.now()
    let result: any
    let errorMessage: string | undefined
    let success = false

    try {
      if (endpoint) {
        // Make HTTP request to agent endpoint
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(`${endpoint}/tools/${toolName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MCP-Platform/1.0',
            'Authorization': `Bearer ${userAgent.config?.api_key || ''}`,
          },
          body: JSON.stringify({ parameters }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          result = await response.json()
          success = true
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
          const errorBody = await response.text()
          if (errorBody) {
            errorMessage += ` - ${errorBody}`
          }
        }
      } else {
        // Simulate tool execution for demo purposes
        // In a real implementation, this would connect to the actual MCP server
        result = {
          tool: toolName,
          parameters,
          timestamp: new Date().toISOString(),
          simulated: true,
          message: `Tool '${toolName}' executed successfully (simulated)`,
        }
        success = true
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Tool execution request timed out'
      } else {
        errorMessage = error.message || 'Unknown error occurred during tool execution'
      }
    }

    const executionTime = Math.round(performance.now() - startTime)
    const now = new Date().toISOString()

    // Update usage statistics
    if (success) {
      await supabaseClient
        .from('user_agents')
        .update({
          usage_count: userAgent.usage_count + 1,
          last_used_at: now,
          updated_at: now,
        })
        .eq('id', userAgent.id)
    } else {
      await supabaseClient
        .from('user_agents')
        .update({
          error_count: userAgent.error_count + 1,
          updated_at: now,
        })
        .eq('id', userAgent.id)
    }

    // Log usage
    await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: userId,
        agent_id: agentId,
        action_type: 'tool_execution',
        action_details: {
          tool_name: toolName,
          parameters,
          endpoint,
          result: success ? result : undefined,
        },
        duration_ms: executionTime,
        status: success ? 'success' : 'error',
        error_message: errorMessage,
      })

    const response: ExecuteToolResponse = {
      success,
      result: success ? result : undefined,
      error: errorMessage,
      execution_time_ms: executionTime,
      details: {
        agent_id: agentId,
        tool_name: toolName,
        parameters,
        timestamp: now,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Execute tool function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})