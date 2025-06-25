import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ProfilePage() {

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline text-accent">USER_PROFILE</h1>
        <p className="text-muted-foreground">Operator session logs and preferences.</p>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-lg text-accent/80">Data Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect to Firebase to synchronize your reading history, bookmarks, and preferences across all your devices.
          </p>
          <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent">
            Connect to Firebase
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-lg text-accent/80">Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="border-border/50">
            <Download className="mr-2 h-4 w-4" /> EXPORT_PINS
          </Button>
          <Button variant="outline" className="border-border/50">
            <Download className="mr-2 h-4 w-4" /> EXPORT_COMPLETED_LOGS
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
