import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { count } from 'node:console'

export async function dietRoutes(app: FastifyInstance) {
  // app.addHook('preHandler', async (request, reply) => {
  //   console.log(`[${request.method}] ${request.url}`)
  // })

  app.post('/users', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const user = await knex('users')
      .insert({
        id: randomUUID(),
        name,
        email,
        password,
        session_id: sessionId,
      })
      .returning('*')

    return reply.status(201).send(user)
  })

  app.post(
    '/meals',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string().nullable(),
        dateHour: z.string(),
        inDiet: z.boolean().default(false),
      })

      const { name, description, dateHour, inDiet } =
        createMealBodySchema.parse(request.body)

      const meal = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description: description || '',
          date_hour: dateHour,
          in_diet: inDiet,
          session_id: sessionId,
        })
        .returning('*')

      return reply.status(201).send(meal)
    },
  )

  app.get(
    '/meals',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals').where('session_id', sessionId).select()

      return { meals }
    },
  )

  app.get(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const meal = await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { meal }
    },
  )

  app.put(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const getMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateHour: z.string(),
        inDiet: z.boolean(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { name, description, dateHour, inDiet } = getMealBodySchema.parse(
        request.body,
      )
      const { sessionId } = request.cookies

      const updatedMeal = await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .update({
          name,
          description,
          date_hour: dateHour,
          in_diet: inDiet,
        })
        .returning('*')

      return { updatedMeal }
    },
  )

  app.delete(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .del()

      return reply.status(200).send({ message: 'Meal successfully deleted!' })
    },
  )

  app.get(
    '/users/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const totalMeals = await knex('meals')
        .where('session_id', sessionId)
        .count('id', { as: 'total_meals' })
        .first()

      const totalMealsInDiet = await knex('meals')
        .where('session_id', sessionId)
        .count('id', { as: 'total_meals_diet' })
        .where('in_diet', true)
        .first()

      const metrics = {
        totalMeals,
        totalMealsInDiet,
      }
      return { metrics }
    },
  )
}
