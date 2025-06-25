import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const SourceStatus = ({ status }: { status: 'Online' | 'Offline' | 'Error' }) => {
  const Icon = status === 'Online' ? CheckCircle : status === 'Offline' ? XCircle : AlertTriangle;
  const color = status === 'Online' ? 'text-accent' : status === 'Offline' ? 'text-muted-foreground' : 'text-destructive';
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={color}>{status}</span>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_CONFIG</h1>
        <p className="text-muted-foreground">Configure operator preferences and system parameters.</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-input border border-border/50">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-accent/80">Visual Interface</CardTitle>
              <CardDescription>Adjust fonts, colors, and layout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="theme-void" className="flex flex-col gap-1">
                  <span>VOID.BLACK</span>
                  <span className="font-normal text-muted-foreground">Black background, white text.</span>
                </Label>
                <Switch id="theme-void" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="theme-paper" className="flex flex-col gap-1">
                  <span>PAPER.WHITE</span>
                  <span className="font-normal text-muted-foreground">White background, black text.</span>
                </Label>
                <Switch id="theme-paper" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reading">
           <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-accent/80">Reader Experience</CardTitle>
              <CardDescription>Customize the transmission reader.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-scroll" className="flex flex-col gap-1">
                  <span>Scroll Mode</span>
                  <span className="font-normal text-muted-foreground">Continuous vertical scrolling.</span>
                </Label>
                <Switch id="mode-scroll" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-paged" className="flex flex-col gap-1">
                  <span>Page Mode</span>
                  <span className="font-normal text-muted-foreground">Horizontal page-by-page turning.</span>
                </Label>
                <Switch id="mode-paged" />
              </div>
               <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-autoscroll" className="flex flex-col gap-1">
                  <span>Auto-scroll</span>
                  <span className="font-normal text-muted-foreground">Automatically scroll content.</span>
                </Label>
                <Switch id="mode-autoscroll" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sources">
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg text-accent/80">Source Manager</CardTitle>
                <CardDescription>Manage content sources.</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="border-border/50">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <p>Project Gutenberg</p>
                <SourceStatus status="Online" />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <p>Standard Ebooks</p>
                <SourceStatus status="Online" />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <p>Local Cache</p>
                <SourceStatus status="Offline" />
              </div>
              <div className="pt-4">
                <Label htmlFor="add-source" className="text-accent/80">Add Source from URL</Label>
                <div className="flex items-center gap-2 mt-2">
                    <Input id="add-source" placeholder="https://example.com/book.epub" className="bg-input border-border/50"/>
                    <Button>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
