import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserCog, User } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tighter">LeadTrack Pulse</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Streamline your team's performance tracking. Log daily tasks, view progress, and stay ahead.</p>
      </div>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Select your role to proceed to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href="/dashboard" passHref>
            <Button className="w-full" size="lg">
              <User className="mr-2" /> Login as Employee
            </Button>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="secondary" className="w-full" size="lg">
              <UserCog className="mr-2" /> Login as Admin
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LeadTrack Pulse. All rights reserved.
      </footer>
    </main>
  );
}
