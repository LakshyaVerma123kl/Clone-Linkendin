// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDatabase, User, Post } from "../models";
import { hashPassword } from "./auth";

const sampleUsers = [
  {
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    password: "password123",
    bio: "Senior Software Engineer at TechCorp | Full-stack developer with 6+ years experience in React, Node.js, and cloud architecture. Passionate about mentoring junior developers and building scalable solutions.",
  },
  {
    name: "Marcus Johnson",
    email: "marcus.j@innovate.io",
    password: "password123",
    bio: "Product Manager at Innovate.io | Leading cross-functional teams to deliver user-centric products. Former software engineer turned PM with expertise in B2B SaaS and mobile applications.",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@designstudio.com",
    password: "password123",
    bio: "UX/UI Designer at Design Studio | Creating intuitive digital experiences that users love. Specialized in design systems, user research, and accessibility. Adobe Certified Expert.",
  },
  {
    name: "David Kim",
    email: "david.kim@datainsights.com",
    password: "password123",
    bio: "Data Scientist at DataInsights | Turning complex data into actionable business insights using machine learning and AI. PhD in Computer Science, published researcher.",
  },
  {
    name: "Jennifer Walsh",
    email: "jen.walsh@marketingpro.com",
    password: "password123",
    bio: "Digital Marketing Manager at MarketingPro | Driving growth through strategic campaigns and data-driven marketing. Expert in SEO, content marketing, and social media strategy.",
  },
  {
    name: "Alex Thompson",
    email: "alex.t@startupventures.com",
    password: "password123",
    bio: "Startup Founder & CEO at Venture Labs | Serial entrepreneur with 3 successful exits. Angel investor helping early-stage startups scale their business and secure funding.",
  },
  {
    name: "Lisa Park",
    email: "lisa.park@cloudtech.io",
    password: "password123",
    bio: "DevOps Engineer at CloudTech | Building and maintaining scalable cloud infrastructure. AWS Certified Solutions Architect with expertise in Kubernetes, Docker, and CI/CD pipelines.",
  },
  {
    name: "Robert Brown",
    email: "robert.brown@consultant.com",
    password: "password123",
    bio: "Management Consultant at Global Consulting | Helping Fortune 500 companies optimize operations and drive digital transformation. MBA from Wharton, 10+ years consulting experience.",
  },
];

const samplePosts = [
  {
    userEmail: "sarah.chen@techcorp.com",
    content:
      "Just wrapped up an amazing hackathon where our team built an AI-powered code review tool! 🚀 It was incredible to see how quickly we could prototype and validate our idea. The key was having diverse perspectives - our designer, PM, and engineers each brought unique insights that made the final product so much stronger. Looking forward to potentially turning this into a real product! #hackathon #AI #teamwork",
  },
  {
    userEmail: "marcus.j@innovate.io",
    content:
      "After analyzing user feedback from our latest product release, I'm reminded why customer-centricity should be at the heart of everything we build. 📊 The features users actually love aren't always the ones we think they will. This is why continuous user research and rapid iteration are so crucial. What methods do you use to stay close to your customers? #productmanagement #userresearch #customerexperience",
  },
  {
    userEmail: "emily.rodriguez@designstudio.com",
    content:
      "Accessibility isn't just a nice-to-have feature—it's a fundamental design principle that makes products better for everyone. 🌟 Just finished conducting usability tests with users who have visual impairments, and their feedback completely changed how I think about our design system. Small changes like better color contrast and clearer focus indicators made such a huge difference. #accessibility #designsystems #inclusivedesign",
  },
  {
    userEmail: "david.kim@datainsights.com",
    content:
      "Excited to share that our machine learning model for predicting customer churn just achieved 94% accuracy in production! 🎯 The key was combining traditional ML techniques with deep learning and ensuring we had high-quality, representative training data. It's amazing how much business impact you can drive when data science is properly integrated into product decisions. #machinelearning #datascience #AI",
  },
  {
    userEmail: "jennifer.walsh@marketingpro.com",
    content:
      "Content marketing ROI doesn't happen overnight, but when it does, it's magical ✨ Our blog traffic has grown 300% over the past year, and more importantly, content-driven leads convert 6x better than other channels. The secret? Understanding your audience deeply and creating genuinely helpful content, not just promotional material. Quality over quantity always wins. #contentmarketing #digitalmarketing #ROI",
  },
  {
    userEmail: "alex.t@startupventures.com",
    content:
      "To all the founders out there: your biggest competition isn't other startups—it's customer inertia. 💡 People are comfortable with the status quo, even when it's suboptimal. Your job isn't just to build a better product; it's to make the pain of not switching greater than the pain of switching. Focus on 10x improvements, not 10% ones. #startup #entrepreneurship #founders",
  },
  {
    userEmail: "lisa.park@cloudtech.io",
    content:
      "Infrastructure as Code has completely transformed how our team deploys and manages applications. 🔧 What used to take hours of manual configuration now happens in minutes with zero human error. If you're not using tools like Terraform and Kubernetes yet, you're missing out on incredible productivity gains. The learning curve is worth it! #devops #kubernetes #infrastructure",
  },
  {
    userEmail: "robert.brown@consultant.com",
    content:
      "Digital transformation isn't about technology—it's about people and processes. 🔄 I've seen too many companies buy expensive software thinking it will solve their problems, only to realize they haven't addressed the underlying workflow issues. Start with understanding your current processes, identify bottlenecks, then choose technology that supports better ways of working. #digitaltransformation #consulting #changemanagement",
  },
  {
    userEmail: "sarah.chen@techcorp.com",
    content:
      "Mentoring junior developers has taught me as much as it's taught them. Today, one of my mentees asked a question that made me completely rethink our caching strategy. 🤔 Sometimes the best insights come from those who aren't constrained by 'the way we've always done things.' Fresh perspectives are invaluable in tech! #mentorship #softwaredevelopment #learning",
  },
  {
    userEmail: "emily.rodriguez@designstudio.com",
    content:
      "User research session today completely validated why we should never assume we know what users want. 📱 What we thought was an intuitive interface was actually confusing to 8 out of 10 participants. Back to the drawing board, but that's exactly where the magic happens! Iteration and user feedback are a designer's best friends. #userresearch #designthinking #iteration",
  },
];

export async function seedDatabase() {
  try {
    await connectToDatabase();

    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        bio: userData.bio,
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create posts
    for (const postData of samplePosts) {
      const author = createdUsers.find(
        (user) => user.email === postData.userEmail
      );
      if (author) {
        await Post.create({
          content: postData.content,
          author: author._id,
        });
        console.log(`✅ Created post by ${author.name}`);
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(
      `📊 Created ${createdUsers.length} users and ${samplePosts.length} posts`
    );

    return {
      success: true,
      usersCreated: createdUsers.length,
      postsCreated: samplePosts.length,
    };
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

// Run the seeding process when executing this file
seedDatabase()
  .then((result) => {
    console.log("✅ Seeding complete!");
    console.log(result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
