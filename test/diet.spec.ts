import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Diet routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })
      .expect(201)
  })

  it('should be able to list all user meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: "Test Meal",
        description: "Meal description",
        dateHour: "10/10/2023 - 10:00",
        inDiet: false
      })

    const meals = await request(app.server)
      .get('/diet/meals')
      .set('Cookie', cookies)

    expect(meals.statusCode).toEqual(200)
    expect(meals.body.meals).toEqual([
      expect.objectContaining({
        name: 'Test Meal',
      }),
    ])
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    const response = await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: 'test meal',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: false,
      })
      .expect(201)
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: 'test meal',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: false,
      })

    const listMealsByUserResponse = await request(app.server)
      .get('/diet/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsByUserResponse.body.meals[0].id

    const getSpecificMealResponse = await request(app.server)
      .get(`/diet/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getSpecificMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'test meal',
        description: 'description',
      }),
    )
  })

  it('should be able to edit an specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: 'test meal',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: false,
      })

    const listMealsByUserResponse = await request(app.server)
      .get('/diet/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsByUserResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .put(`/diet/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'test meal updated',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: true,
      })
      .expect(200)

    expect(getMealResponse.body.updatedMeal).toEqual([
      expect.objectContaining({
        name: 'test meal updated',
      })
    ])
  })

  it('should be able to delete an specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: 'test meal',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: false,
      })

    const listMealsByUserResponse = await request(app.server)
      .get('/diet/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsByUserResponse.body.meals[0].id

    await request(app.server)
      .delete(`/diet/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should be able to get the user metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/diet/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diet/meals')
      .set('Cookie', cookies)
      .send({
        name: 'test meal',
        description: 'description',
        dateHour: '10/10/2023 - 10:10',
        inDiet: false,
      })

    const metricsResponse = await request(app.server)
      .get('/diet/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body.metrics.totalMeals).toEqual({
      total_meals: 1,
    })
  })
})
