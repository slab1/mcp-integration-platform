import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckRequest {
  agentId: string
  userId: string
  endpoint?: string
}

interface HealthCheckResponse {
  success: boolean
  status: 'healthy' | 'unhealthy' | 'timeout' | 'error'
  response_time_ms: number
  details: {
    agent_id: string
    endpoint?: string
    error_message?: string
    last_checked: string
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
    const { agentId, userId, endpoint }: HealthCheckRequest = await req.json()

    if (!agentId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, userId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get agent details from database
    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .select('name, status, metadata')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Perform health check
    const startTime = performance.now()
    let healthStatus: 'healthy' | 'unhealthy' | 'timeout' | 'error' = 'healthy'
    let errorMessage: string | undefined

    try {
      // If endpoint is provided, make HTTP request
      if (endpoint) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MCP-Platform-Health-Check/1.0',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          healthStatus = 'unhealthy'
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
      } else {
        // Basic connectivity check - agent exists and is active
        if (agent.status !== 'active') {
          healthStatus = 'unhealthy'
          errorMessage = `Agent status is ${agent.status}`
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        healthStatus = 'timeout'
        errorMessage = 'Health check request timed out'
      } else {
        healthStatus = 'error'
        errorMessage = error.message || 'Unknown error occurred'
      }
    }

    const responseTime = Math.round(performance.now() - startTime)
    const now = new Date().toISOString()

    // Update user_agents table with health check results
    const { error: updateError } = await supabaseClient
      .from('user_agents')
      .update({
        last_health_check: now,
        health_status: healthStatus,
        health_details: {
          response_time_ms: responseTime,
          endpoint,
          error_message: errorMessage,
          last_checked: now,
        },
        updated_at: now,
      })
      .eq('user_id', userId)
      .eq('agent_id', agentId)

    if (updateError) {
      console.error('Failed to update health check results:', updateError)
    }

    // Log usage
    await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: userId,
        agent_id: agentId,
        action_type: 'health_check',
        action_details: {
          endpoint,
          response_time_ms: responseTime,
          status: healthStatus,
        },
        duration_ms: responseTime,
        status: healthStatus === 'healthy' ? 'success' : 'error',
        error_message: errorMessage,
      })

    const response: HealthCheckResponse = {
      success: healthStatus === 'healthy',
      status: healthStatus,
      response_time_ms: responseTime,
      details: {
        agent_id: agentId,
        endpoint,
        error_message: errorMessage,
        last_checked: now,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Health check function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})