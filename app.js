import Fastify from "fastify";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
dotenv.config();

import Client from "@notionhq/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });
export default async function (fastify, opts) {
  fastify.register(import("fastify-static"), {
    root: join(__dirname, "public"),
    prefix: "/public/" // optional: default '/'
  });

  const notion = new Client.Client({
    auth: process.env.NOTION_TOKEN
  });

  fastify.get("/", async function (request, reply) {
    console.log("starting the tools ...");
    return "BACKEND SCORECARD LEARNING TOOLS.";
  });

  fastify.get("/teams", async function (request, reply) {
    console.log("accessing teams page");
    return reply.sendFile("teams.html"); // serving path.join(__dirname, 'public', 'myHtml.html') directly
  });

  fastify.get("/api/get/teams", async function (request, reply) {
    const teams = await notion.databases.query({
      database_id: process.env.TEAMS_DB
    });

    return teams.results;
  });

  fastify.get("/api/get/users", async function (request, reply) {
    const teams = await notion.users.list({
      auth: process.env.NOTION_TOKEN
    });

    return teams.results;
  });

  fastify.post("/store/team", async function (request, reply) {
    const {name, email, employee_id, title, skills, grade, user, direct_report, lead, manager } = request.body;

    console.log(user)
    const create = await notion.pages.create({
      parent: {
        database_id: process.env.TEAMS_DB
      },
      properties: {
        name: {
          title:[
            {
              text: {
                content: name
              }
            }
          ]
        },
        "id": {
          id: "_fX|",
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: employee_id
              }
            }
          ]
        },
        email: {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: email
              }
            }
          ]
        },
        "job title": {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        skills: {
          type: 'multi_select',
          multi_select: [
            {
              name: skills,
            }
          ]
        },
        grade: {
          number: parseFloat(grade),
        },
        user: {
          people:[
            {
              object: "user",
              id: user
            }
          ]
        },
        "direct report": {
          people:[
            {
              object: "user",
              id: direct_report
            }
          ]
        },
        lead: {
          people:[
            {
              object: "user",
              id: lead
            }
          ]
        },
        manager: {
          people:[
            {
              object: "user",
              id: manager
            }
          ]
        }
      }
    });
    console.log("create", create);

    return create;
  });

  fastify.get("/learning", async function (request, reply) {
    console.log("accessing learning page");
    return reply.sendFile("learning.html"); // serving path.join(__dirname, 'public', 'learning.html') directly
  });

  fastify.get("/api/get/learning_categories", async function (request, reply) {
    const learning_categories = await notion.databases.query({
      database_id: process.env.LEARNING_CATEGORY_DB
    });

    return learning_categories.results;
  });

  fastify.post("/learning", async function (request, reply) {
    const { learning_name, learner, learning_category, learning_date, point_to_claim, status} = request.body;
    const date = new Date(learning_date)
    const create = await notion.pages.create({
      parent: {
        database_id: process.env.LEARNING_DB
      },
      properties: {
        "Learning Name": {
          title:[
            {
              text: {
                content: learning_name
              }
            }
          ]
        },
        Learner: {
          type: 'relation',
          relation: [
            {
              id: learner,
            }
          ]
        },
        "Learning Category": {
          type: 'relation',
          relation: [
            {
              id: learning_category,
            }
          ]
        },
        "Learning Date": {
          date:{
            start: date
          }
        },
        "Point to Claim": {
          number: parseFloat(point_to_claim),
        },
        Status: {
          type: 'select',
          select: {
            name: status
          }
        }
      }
    });
    console.log("create", create);

    return create;
  });

  fastify.listen(process.env.PORT, () => {
    console.log("running on port: " + process.env.PORT);
  });

}
