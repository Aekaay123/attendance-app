'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  BarChart,
  Shield,
  Globe,
  LogIn,
} from "lucide-react"

export default function Homepage() {
  const [isHovering, setIsHovering] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-green-600 text-white">
      <header className="p-2 sticky top-0 bg-gradient-to-r from-blue-200 to-purple-500 bg-opacity-90 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center">
          <div className="flex">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-orange-900 to-green-500 bg-clip-text text-transparent"
            >
              Attendance Manager
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={() => signIn("google")}
              className="bg-orange-600 hover:bg-orange-700 text-white p-3 hover:scale-105 transition-all duration-300 rounded-xl font-bold text-md shadow-lg flex items-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign in with Google</span>
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto mt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionize Your Attendance Tracking
          </h2>
          <p className="text-xl md:text-2xl mb-12">
            Effortless check-ins, insightful analytics, and seamless team
            management — all in one powerful platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          <FeatureCard
            icon={<Calendar className="w-12 h-12" />}
            title="Smart Scheduling"
          >
            Intelligent scheduling algorithms optimize your team productivity
            and work-life balance.
          </FeatureCard>
          <FeatureCard
            icon={<Clock className="w-12 h-12" />}
            title="Real-time Tracking"
          >
            Monitor attendance, working hours, and breaks in real-time for
            unparalleled insights.
          </FeatureCard>
          <FeatureCard
            icon={<Users className="w-12 h-12" />}
            title="Team Management"
          >
            Efficiently manage your team attendance, time-off requests, and
            shift swaps with ease.
          </FeatureCard>
          <FeatureCard
            icon={<BarChart className="w-12 h-12" />}
            title="Advanced Analytics"
          >
            Gain valuable insights with our powerful analytics tools and
            customizable reports.
          </FeatureCard>
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Secure & Compliant"
          >
            Rest easy knowing your data is protected with state-of-the-art
            security measures.
          </FeatureCard>
          <FeatureCard
            icon={<Globe className="w-12 h-12" />}
            title="Global Accessibility"
          >
            Access your attendance system from anywhere, on any device, at any
            time.
          </FeatureCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mb-20"
        >
          <Button
            size="lg"
            className="bg-white rounded-xl text-purple-600 hover:bg-purple-100"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Get Started
            <motion.div
              animate={{ x: isHovering ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronRight className="ml-2 h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-bold mb-4">
              Streamline Your Workflow
            </h3>
            <p className="mb-4">
              AttendEase integrates seamlessly with your existing tools, making
              attendance management a breeze. Say goodbye to manual time
              tracking and hello to increased productivity.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Automated time tracking</li>
              <li>Custom absence management</li>
              <li>Intuitive mobile app</li>
              <li>Integration with popular HR tools</li>
            </ul>
            <Button variant="outline">Learn More</Button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="rounded-lg overflow-hidden shadow-xl"
          >
            <img
              src="https://img.freepik.com/free-vector/workforce-organization-management-workflow-processes-workflow-process-design-automation-boost-your-office-productivity-concept_335657-695.jpg?t=st=1729602552~exp=1729606152~hmac=83e7cf59a3d5f0d0bfb9c895d6acf672f2d0c03ff92c823547550eceb9fed9dd&w=1060"
              alt="Streamlined workflow illustration"
              className="w-full object-fill backdrop-blur-sms h-auto"
            />
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-lg overflow-hidden shadow-xl md:order-2"
          >
            <img
              src="https://img.freepik.com/free-vector/flat-design-data-driven-illustration_23-2149493077.jpg?t=st=1729602676~exp=1729606276~hmac=20693b9d5a45f7af4b3a3bd8ad0342b768e6745009124bb5efd318e58e91dce5&w=740"
              alt="Data-driven insights illustration"
              className="w-full h-auto"
            />
          </motion.div>
          <motion.div variants={itemVariants} className="md:order-1">
            <h3 className="text-3xl font-bold mb-4">Data-Driven Insights</h3>
            <p className="mb-4">
              Harness the power of your attendance data with our advanced
              analytics tools. Identify trends, optimize schedules, and make
              informed decisions to boost your team performance.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Customizable dashboards</li>
              <li>Predictive absence patterns</li>
              <li>Overtime analysis</li>
              <li>Team productivity metrics</li>
            </ul>
            <Button variant="outline">Explore Analytics</Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-purple-700 rounded-lg p-2 text-center mb-20"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl font-bold mb-4"
          >
            Ready to Transform Your Attendance Management?
          </motion.h3>
          <motion.p variants={itemVariants} className="mb-8">
            Join thousands of satisfied companies and experience the AttendEase
            difference today.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="bg-white text-purple-600 rounded-xl hover:bg-purple-100"
            >
              Join now
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-purple-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">AttendEase</h4>
              <p className="opacity-75">
                Revolutionizing attendance management for modern businesses.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Product</h5>
              <ul className="space-y-2 opacity-75">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Company</h5>
              <ul className="space-y-2 opacity-75">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Connect</h5>
              <ul className="space-y-2 opacity-75">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Facebook</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-purple-700 text-center opacity-75">
            <p>&copy; 2024 Tashicell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="bg-white bg-opacity-10 border-none">
        <CardContent className="p-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
            <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
            <p className="text-sm opacity-75">{children}</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}